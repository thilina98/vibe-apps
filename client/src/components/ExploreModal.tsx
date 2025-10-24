import { X, Search, Grid3x3, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link } from "wouter";

interface ExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Tool {
  id: string;
  name: string;
  websiteUrl?: string | null;
  logoUrl?: string | null;
}

export function ExploreModal({ isOpen, onClose }: ExploreModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("category");
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeSection === "tool") {
      fetchTools();
    }
  }, [activeSection]);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tools");
      const data = await response.json();
      setTools(data);
    } catch (error) {
      console.error("Error fetching tools:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const categories = [
    "Productivity",
    "Communication",
    "Entertainment",
    "Education",
    "Finance",
    "Health & Fitness",
    "Shopping",
    "Travel",
  ];

  const displayItems = activeSection === "category"
    ? categories
    : tools.map(tool => tool.name);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-[900px] h-[300px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Full Width Search Bar at Top */}
        <div className="w-full px-6 py-4 bg-white">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by Inspiration"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 text-base border-gray-300 focus-visible:ring-gray-400"
            />
          </div>
        </div>

        {/* Main Content Area with Sidebar and Items */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-64 bg-white p-6">
            <div className="space-y-2">
              <button
                onClick={() => setActiveSection("category")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === "category"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-600 hover:bg-white/50"
                }`}
              >
                <Grid3x3 className="h-5 w-5" />
                <span className="font-medium">By Category</span>
              </button>
              <button
                onClick={() => setActiveSection("tool")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === "tool"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-600 hover:bg-white/50"
                }`}
              >
                <Wrench className="h-5 w-5" />
                <span className="font-medium">By Tool</span>
              </button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : (
              <div className="grid grid-cols-2 gap-x-12 gap-y-1">
                {displayItems.map((item) => (
                  <Link
                    key={item}
                    href={`/explore?${activeSection === "category" ? "category" : "tool"}=${encodeURIComponent(item)}`}
                    onClick={onClose}
                  >
                    <div className="py-2 hover:opacity-60 transition-opacity cursor-pointer">
                      <span className="text-sm text-gray-900">
                        {item}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
