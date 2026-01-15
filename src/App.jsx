import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const [code, setCode] = useState("");
  const [terminalDetails, setTerminalDetails] = useState(null);
  const [allTerminals, setAllTerminals] = useState([]);
  const [searchNumber, setSearchNumber] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const API_BASE_URL =
    "https://test.xpresspayments.com:9007/api/TerminalNumber";

  // Load all terminals on component mount
  useEffect(() => {
    handleGetAllTerminals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to generate terminal number via API
  const handleGenerateCode = async () => {
    setLoading(true);
    setCode("");
    setTerminalDetails(null);
    setSearchResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/GenerateTerminalNumber`, {
        method: "POST",
        headers: {
          accept: "*/*",
        },
      });

      const data = await response.json();

      if (data.responseCode === "00") {
        setCode(data.data);
        toast.success("Terminal number generated successfully!");
        await fetchTerminalDetails(data.data);
        handleGetAllTerminals();
      } else {
        toast.error(
          data.responseMessage || "Failed to generate terminal number"
        );
      }
    } catch (err) {
      toast.error("Network error. Please check your connection.");
      console.error("Error generating code:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch terminal details by number
  const fetchTerminalDetails = async (number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/GetTerminalNumberByNumber?number=${number}`,
        {
          headers: {
            accept: "*/*",
          },
        }
      );

      const data = await response.json();

      if (data.responseCode === "00") {
        setTerminalDetails(data.data);
      }
    } catch (err) {
      console.error("Error fetching terminal details:", err);
    }
  };

  // Function to search terminal by number
  const handleSearchTerminal = async () => {
    if (!searchNumber.trim()) {
      toast.error("Please enter a terminal number");
      return;
    }

    setLoadingSearch(true);
    setSearchResult(null);
    setCode("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/GetTerminalNumberByNumber?number=${searchNumber.trim()}`,
        {
          headers: {
            accept: "*/*",
          },
        }
      );

      const data = await response.json();

      if (data.responseCode === "00") {
        setSearchResult(data.data);
        toast.success("Terminal found!");
      } else {
        toast.error(data.responseMessage || "Terminal not found");
      }
    } catch (err) {
      toast.error("Network error. Please check your connection.");
      console.error("Error searching terminal:", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Function to fetch all terminals
  const handleGetAllTerminals = async () => {
    setLoadingAll(true);

    try {
      const response = await fetch(`${API_BASE_URL}/GetAllTerminalNumbers`, {
        headers: {
          accept: "*/*",
        },
      });

      const data = await response.json();

      if (data.responseCode === "00") {
        setAllTerminals(data.data || []);
        if (allTerminals.length === 0 && data.data?.length > 0) {
          toast.success(`Loaded ${data.data.length} terminals`);
        }
      } else {
        toast.error(data.responseMessage || "Failed to fetch terminals");
        setAllTerminals([]);
      }
    } catch (err) {
      toast.error("Network error. Unable to load terminals.");
      console.error("Error fetching all terminals:", err);
      setAllTerminals([]);
    } finally {
      setLoadingAll(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Pagination calculations
  const totalPages = Math.ceil(allTerminals.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTerminals = allTerminals.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Reset to first page when terminals data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [allTerminals.length]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#000",
            border: "2px solid #10b981",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
            style: {
              border: "2px solid #ef4444",
            },
          },
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            POS Terminal Code Generator
          </h1>
          <p className="text-sm text-gray-600">
            Generate and manage terminal numbers
          </p>
        </header>

        {/* Top Controls - Search and Generate */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-3">
            <input
              type="text"
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value.toUpperCase())}
              onKeyPress={(e) =>
                e.key === "Enter" &&
                !loadingSearch &&
                searchNumber.trim() &&
                handleSearchTerminal()
              }
              placeholder="Search terminal number..."
              disabled={loadingSearch}
              className="flex-1 px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
            <button
              onClick={handleSearchTerminal}
              disabled={loadingSearch || !searchNumber.trim()}
              className="px-6 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loadingSearch ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </div>

          <button
            onClick={handleGenerateCode}
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span className="text-xl font-light">+</span>
                <span>Generate New</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Code Display */}
        {code && !loading && (
          <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-white border-2 border-emerald-500 rounded-xl shadow-lg animate-slideDown">
            <div className="mb-4">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                New Terminal Code
              </span>
              <div className="mt-2 text-2xl font-bold text-gray-900 font-mono tracking-wider">
                {code}
              </div>
            </div>
            {terminalDetails && (
              <div className="pt-4 border-t border-gray-200 flex gap-6 text-sm">
                <span className="text-gray-600">
                  <strong className="text-gray-900">ID:</strong>{" "}
                  {terminalDetails.terminalNumberId}
                </span>
                <span className="text-gray-600">
                  <strong className="text-gray-900">Created:</strong>{" "}
                  {formatDate(terminalDetails.dateCreated)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Search Result Display */}
        {searchResult && !code && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-white border-2 border-blue-500 rounded-xl shadow-lg animate-slideDown">
            <div className="mb-4">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Search Result
              </span>
              <div className="mt-2 text-2xl font-bold text-gray-900 font-mono tracking-wider">
                {searchResult.number}
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 flex gap-6 text-sm">
              <span className="text-gray-600">
                <strong className="text-gray-900">ID:</strong>{" "}
                {searchResult.terminalNumberId}
              </span>
              <span className="text-gray-600">
                <strong className="text-gray-900">Created:</strong>{" "}
                {formatDate(searchResult.dateCreated)}
              </span>
            </div>
          </div>
        )}

        {/* All Terminal Codes Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              All Terminal Codes
            </h2>
            {allTerminals.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  Total Arrivals: {allTerminals.length}
                </span>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="itemsPerPage"
                    className="text-sm text-gray-600"
                  >
                    Show per Page:
                  </label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) =>
                      handleItemsPerPageChange(Number(e.target.value))
                    }
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {loadingAll ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
              <p className="mt-4 text-sm text-gray-600">Loading terminals...</p>
            </div>
          ) : allTerminals.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        S/N
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Terminal Number
                        <button className="ml-1 inline-flex items-center">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5 10l5-5 5 5H5z" />
                          </svg>
                        </button>
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date Created
                        <button className="ml-1 inline-flex items-center">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5 10l5-5 5 5H5z" />
                          </svg>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Time
                        <button className="ml-1 inline-flex items-center">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5 10l5-5 5 5H5z" />
                          </svg>
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTerminals.map((terminal, index) => (
                      <tr
                        key={terminal.terminalNumberId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            href={`#terminal-${terminal.number}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {terminal.number}
                          </a>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(terminal.dateCreated)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(terminal.dateCreated).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            typeof page === "number" && handlePageChange(page)
                          }
                          disabled={page === "..."}
                          className={`min-w-[40px] h-10 px-3 text-sm font-medium rounded-lg transition-colors ${
                            page === currentPage
                              ? "bg-emerald-500 text-white"
                              : page === "..."
                              ? "cursor-default text-gray-400"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="text-sm text-gray-600">
                    Show per Page:{" "}
                    <select
                      value={itemsPerPage}
                      onChange={(e) =>
                        handleItemsPerPageChange(Number(e.target.value))
                      }
                      className="ml-2 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No terminals available
              </h3>
              <p className="text-sm text-gray-600">
                Generate your first terminal number to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
