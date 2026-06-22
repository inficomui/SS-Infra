import OwnerDetails from './OwnerDetails'

export const dynamicParams = false;

export async function generateStaticParams() {
    return [{ id: 'placeholder' }]
}

export default async function OwnerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (id === 'placeholder') return null
    return <OwnerDetails id={id} />
}
