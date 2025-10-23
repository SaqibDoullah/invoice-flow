
import ProductDetailPageContent from './product-detail-page-content';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    return (
        <ProductDetailPageContent productId={params.id} />
    )
}
