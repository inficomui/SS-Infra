import OperatorDetails from './OperatorDetails'

export async function generateStaticParams() {
    return []
}

export default async function OperatorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <OperatorDetails id={id} />
}
