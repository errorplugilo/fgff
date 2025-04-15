// ui/src/pages/Companies.tsx
import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import { useNavigate } from "react-router-dom";
import brain from "brain";
import { Company } from "types"; // Assuming types are generated correctly

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { List, LayoutGrid, Plus } from "lucide-react"; // Icons for view toggle & Add
import { CompanyCardGrid } from "components/CompanyCardGrid"; // Correct import path
import { CompanyFormDialog } from "components/CompanyFormDialog"; // Import the dialog

const CompaniesPage: React.FC = () => {
  const navigate = useNavigate(); // Add useNavigate hook
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid"); // Default to grid

  // Add a function to fetch companies (refactored from useEffect)
  const fetchCompanies = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching companies...");
        const response = await brain.list_companies();
        const data = await response.json();
        console.log("Companies data received:", data);
        setCompanies(data.companies || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError("Failed to load companies. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }, []); // useCallback with empty dependency array

  // Fetch companies on initial mount
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]); // Run when fetchCompanies changes (only on mount due to useCallback)

  // Define the success handler for the form dialog
  const handleSaveSuccess = (savedCompany: Company) => {
      console.log("Company saved/updated, refreshing list...", savedCompany);
      // Re-fetch the list to show the new/updated company
      fetchCompanies();
      // Alternatively, could optimistically update state:
      // if (isEditMode) { // Need to know if it was edit or add
      //   setCompanies(prev => prev.map(c => c.id === savedCompany.id ? savedCompany : c));
      // } else {
      //   setCompanies(prev => [...prev, savedCompany]);
      // }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Companies</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Search/Filter Input - Functionality later */}
          <Input
            type="search"
            placeholder="Filter companies..."
            className="flex-grow md:flex-grow-0 md:w-64"
          />
          {/* View Mode Toggle */}
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
           {/* Replace static button with Dialog */}
           <CompanyFormDialog
              triggerButton={
                  <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add Company
                  </Button>
              }
              onSaveSuccess={handleSaveSuccess}
              // companyToEdit is omitted for create mode
            />
        </div>
      </header>

      <main>
        {isLoading && <p className="text-center text-muted-foreground">Loading companies...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!isLoading && !error && companies.length === 0 && (
          <p className="text-center text-muted-foreground">No companies found.</p>
        )}

        {/* Render Grid or List based on viewMode */}
        {!isLoading && !error && companies.length > 0 && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {companies.map((company) => (
                  <CompanyCardGrid key={company.id} company={company} />
                ))}
              </div>
            ) : (
              // Placeholder for List View (to be implemented next)
              <div className="space-y-2">
                 <p className="text-center text-muted-foreground py-8">List view coming soon...</p>
                {/* Temporary list for now, will be replaced */}
                {/* {companies.map((company) => (
                   <div
                     key={company.id}
                     onClick={() => navigate(`/CompanyDetail?id=${company.id}`)}
                     className="cursor-pointer hover:bg-gray-100 p-3 rounded border flex justify-between items-center"
                   >
                      <span>{company.name}</span>
                      <span className="text-sm text-muted-foreground">{company.industry}</span>
                   </div>
                 ))}*/}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default CompaniesPage;
