import InvoiceList from "./invoice-list";

export const metadata = {
  title: "Invoices",
};

// If you want to read search params from the URL (?q= & status=)
type PageProps = {
  searchParams?: {
    q?: string;
    status?: string;
  };
};

export default function Page({ searchParams }: PageProps) {
  const searchTerm = (searchParams?.q ?? "").toString();
  const statusFilter = (searchParams?.status ?? "all").toString();

  return <InvoiceList searchTerm={searchTerm} statusFilter={statusFilter} />;
}
