import { initializeApp } from "firebase/app"
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, addDoc } from "firebase/firestore"
import { MercadoPagoConfig, Payment } from 'mercadopago'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MP_ACCESS_TOKEN

if (!MP_ACCESS_TOKEN) {
  console.error("❌ Error: MP_ACCESS_TOKEN or NEXT_PUBLIC_MP_ACCESS_TOKEN not found in .env.local")
  process.exit(1)
}

const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN })
const paymentClient = new Payment(client)

async function reconcilePurchase(paymentId: string) {
  console.log(`🔄 Starting reconciliation for Payment ID: ${paymentId}`)
  console.log(`🔑 Using Access Token: ${MP_ACCESS_TOKEN.substring(0, 10)}...`)

  try {
    // 1. Get Payment from MercadoPago to verify and get external_reference
    console.log("📡 Fetching payment details from MercadoPago...")
    const payment = await paymentClient.get({ id: paymentId })
    
    if (!payment) {
      throw new Error("Payment not found in MercadoPago")
    }

    console.log(`✅ Payment found. Status: ${payment.status}`)
    
    if (payment.status !== 'approved') {
      console.warn(`⚠️ Warning: Payment status is '${payment.status}'. Proceeding anyway...`)
    }

    const externalReference = payment.external_reference
    
    if (!externalReference) {
      throw new Error("Payment has no external_reference (purchase ID)")
    }

    console.log(`📦 External Reference (Purchase ID): ${externalReference}`)

    // 2. Find Pending Purchase in Firestore
    console.log("🔍 Searching for pending purchase in Firestore...")
    const pendingRef = doc(db, "pending_purchases", externalReference)
    const pendingSnap = await getDoc(pendingRef)

    if (!pendingSnap.exists()) {
      // Check if it's already in purchases
      const purchasesRef = collection(db, "purchases")
      // Querying purchases by ID is tricky if ID changed, but usually we generate a new ID.
      // Let's assume if it's not in pending, it might be done or lost.
      // But we can verify if the externalReference matches a purchase doc ID? 
      // In this codebase, completed purchase ID != pending purchase ID usually?
      // Wait, in handleWebhook: const purchaseRef = await addDoc(collection(db, "purchases"), purchaseData)
      // So the ID changes.
      
      console.error("❌ Pending purchase not found. It might have been already processed or the ID is wrong.")
      return
    }

    const purchaseData = pendingSnap.data()
    console.log("✅ Pending purchase found:", purchaseData.buyerEmail)

    // 3. Move to Purchases collection
    console.log("🚀 Moving to completed purchases...")
    
    const completedPurchaseData = {
      ...purchaseData,
      paymentId: payment.id?.toString(),
      status: payment.status, // approved
      paymentMethod: payment.payment_method_id,
      paidToSellers: false,
      updatedAt: new Date(),
      // Ensure date objects are valid (Firestore timestamps might need conversion if raw JSON)
      // client SDK handles it if it's already a Timestamp object from the getDoc
    }

    // Remove fields that shouldn't be in completed if any (optional)
    
    const purchaseRef = await addDoc(collection(db, "purchases"), completedPurchaseData)
    console.log(`✅ Created purchase document: ${purchaseRef.id}`)

    // 4. Delete from Pending
    await deleteDoc(pendingRef)
    console.log("🗑️ Deleted from pending_purchases")

    console.log("🎉 Reconciliation complete!")
    process.exit(0)

  } catch (error) {
    console.error("❌ Error during reconciliation:", error)
    process.exit(1)
  }
}

const paymentId = process.argv[2]
if (!paymentId) {
  console.log("Usage: npx tsx scripts/reconcile-purchase.ts <payment_id>")
  process.exit(1)
}

reconcilePurchase(paymentId)
