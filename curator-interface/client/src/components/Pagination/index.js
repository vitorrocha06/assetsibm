import { Pagination } from "@carbon/react";
import { useGlobalState } from "../../hooks/globalState";

export function PaginationFooter() {
  const {
    logs,
    setLogs,
    itensPerPage,
    setItensPerPage,
    currentPage,
    setCurrentPage,
  } = useGlobalState();

  return (
    <Pagination
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        zIndex: 8001,
      }}
      backwardText="Previous page"
      size="lg"
      forwardText="Next page"
      itemsPerPageText="Items per page:"
      onChange={(data) => {
        setCurrentPage(data.page);
      }}
      page={currentPage}
      pageSize={itensPerPage}
      pageSizes={[itensPerPage]}
      totalItems={logs ? Object.keys(logs).length : 0}
    />
  );
}
