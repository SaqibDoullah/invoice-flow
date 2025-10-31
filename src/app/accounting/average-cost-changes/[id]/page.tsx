
import AverageCostChangePageContent from './average-cost-change-page-content';

export default function AverageCostChangePage({ params }: { params: { id: string } }) {
    return <AverageCostChangePageContent id={params.id} />;
}
