import OwnerDetails from './OwnerDetails'

export async function generateStaticParams() {
    return []
}

export default async function OwnerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <OwnerDetails id={id} />
}
