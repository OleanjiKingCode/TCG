import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [terminalDetails, setTerminalDetails] = useState(null);
  const [allTerminals, setAllTerminals] = useState([]);
  const [searchNumber, setSearchNumber] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);

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
        // Fetch details of the generated terminal
        await fetchTerminalDetails(data.data);
        // Refresh the terminals list
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
          // Only show toast on initial load if terminals are found
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
    return date.toLocaleString();
  };

  return (
    <div className="app-container">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#000",
            border: "2px solid #23ab76",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
          },
          success: {
            iconTheme: {
              primary: "#23ab76",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#d32f2f",
              secondary: "#fff",
            },
            style: {
              border: "2px solid #d32f2f",
            },
          },
        }}
      />

      <header className="header">
        <h1 className="title">POS Terminal Code Generator</h1>
        <p className="subtitle">Generate and manage terminal numbers</p>
      </header>

      {/* Top Controls - Search and Generate */}
      <div className="top-controls">
        <div className="search-container">
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
            className="search-input"
          />
          <button
            className="search-button text-sm"
            onClick={handleSearchTerminal}
            disabled={loadingSearch || !searchNumber.trim()}
            title="Search"
          >
            {loadingSearch ? <span className="spinner-small"></span> : "Search"}
          </button>
        </div>

        <button
          className="generate-button"
          onClick={handleGenerateCode}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-small"></span>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span className="button-icon">+</span>
              <span>Generate New</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Code Display */}
      {code && !loading && (
        <div className="new-code-display animate-in">
          <div className="code-content">
            <span className="new-code-label">New Terminal Code</span>
            <span className="new-code-value">{code}</span>
          </div>
          {terminalDetails && (
            <div className="code-meta">
              <span className="meta-item">
                <strong>ID:</strong> {terminalDetails.terminalNumberId}
              </span>
              <span className="meta-item">
                <strong>Created:</strong>{" "}
                {formatDate(terminalDetails.dateCreated)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Search Result Display */}
      {searchResult && !code && (
        <div className="new-code-display animate-in">
          <div className="code-content">
            <span className="new-code-label">Search Result</span>
            <span className="new-code-value">{searchResult.number}</span>
          </div>
          <div className="code-meta">
            <span className="meta-item">
              <strong>ID:</strong> {searchResult.terminalNumberId}
            </span>
            <span className="meta-item">
              <strong>Created:</strong> {formatDate(searchResult.dateCreated)}
            </span>
          </div>
        </div>
      )}

      {/* All Terminal Codes Grid */}
      <div className="terminals-section">
        <div className="section-header">
          <h2>All Terminal Codes</h2>
          {allTerminals.length > 0 && (
            <span className="terminal-count">
              {allTerminals.length} terminals
            </span>
          )}
        </div>

        {loadingAll ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading terminals...</p>
          </div>
        ) : allTerminals.length > 0 ? (
          <div className="terminals-grid">
            {allTerminals.map((terminal, index) => (
              <div
                key={terminal.terminalNumberId}
                className="terminal-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="card-header">
                  <span className="card-badge">
                    #{terminal.terminalNumberId}
                  </span>
                </div>
                <div className="terminal-number">{terminal.number}</div>
                <div className="terminal-info">
                  <span className="info-label">Created</span>
                  <span className="info-value">
                    {formatDate(terminal.dateCreated)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No terminals available</h3>
            <p>Generate your first terminal number to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
