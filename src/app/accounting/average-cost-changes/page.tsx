
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import AverageCostChangesPageContent from './average-cost-changes-page-content';

export default function AverageCostChangesPage() {
    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                    <Home className="w-4 h-4" />
                    Home
                </Link>
                <ChevronRight className="w-4 h-4" />
                <Link href="/accounting" className="hover:text-foreground">
                    Accounting
                </Link>
                 <ChevronRight className="w-4 h-4" />
                <span>Average cost changes</span>
            </div>
            <AverageCostChangesPageContent />
        </div>
    );
}
