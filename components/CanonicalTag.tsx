import Head from 'next/head'

interface CanonicalTagProps {
  url: string
}

export default function CanonicalTag({ url }: CanonicalTagProps) {
  return (
    <Head>
      <link rel="canonical" href={url} />
    </Head>
  )
}
