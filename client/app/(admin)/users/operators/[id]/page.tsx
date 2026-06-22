import OperatorDetails from './OperatorDetails'

export const dynamicParams = false;

export async function generateStaticParams() {
    return [{ id: 'placeholder' }]
}

export default async function OperatorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (id === 'placeholder') return null
    return <OperatorDetails id={id} />
}
