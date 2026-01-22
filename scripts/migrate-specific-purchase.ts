import { config } from "dotenv";
import { resolve } from "path";
import { cert, initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Load environment variables
config({ path: resolve(__dirname, "../.env.local") });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Error: Missing Firebase Admin credentials in .env.local");
  console.error("Please ensure FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are set.");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const db = getFirestore();

const PENDING_COLLECTION = "pending_purchases";
const PURCHASES_COLLECTION = "purchases";
const TARGET_ID = "purchase_1768531715840_dq9tn2hno";

async function migratePurchase() {
  try {
    console.log(`Reading document ${TARGET_ID} from ${PENDING_COLLECTION}...`);
    const docRef = db.collection(PENDING_COLLECTION).doc(TARGET_ID);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.error("❌ Document not found in pending_purchases!");
      return;
    }

    const data = docSnap.data();
    console.log("Details found for:", data?.buyerName);

    // Prepare data for purchases collection
    // Using a fictitious payment ID as requested
    const newPaymentId = "payment_ficticio_" + Date.now();
    
    // Ensure all required fields for 'purchases' are present.
    // We assume the schema is compatible, but we ensure 'status' is set.
    const purchaseData = {
        ...data,
        paymentId: newPaymentId,
        migratedFromPending: true,
        migratedAt: new Date(),
        // Force status to 'approved' or 'pending' as appropriate.
        // Since it's a forced migration to 'purchases', we assume it should be treated as a valid purchase.
        status: 'approved',
        orderStatus: data?.orderStatus || 'en_preparacion'
    };

    console.log(`Writing to ${PURCHASES_COLLECTION} with ID ${TARGET_ID}...`);
    
    // Using the same ID to maintain traceability
    await db.collection(PURCHASES_COLLECTION).doc(TARGET_ID).set(purchaseData);
    
    console.log("✅ Migration successful!");
    console.log(`New document location: ${PURCHASES_COLLECTION}/${TARGET_ID}`);
    console.log(`Fictitious Payment ID assigned: ${newPaymentId}`);

  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

migratePurchase();
