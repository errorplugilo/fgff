// ui/src/pages/CompanyDetail.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import brain from "brain";
import { Company, Contact } from "types"; // Make sure Contact type is available in types.ts
import { toast } from "sonner"; // Import toast for potential future use

// Import UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Building, Users, DollarSign, BrainCircuit, Tag, Mail, Phone /* Add more icons as needed */ } from "lucide-react"; // Import relevant icons
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { CompanyFormDialog } from "components/CompanyFormDialog"; // Import the dialog
import { Pencil } from "lucide-react"; // Added Pencil icon

// Helper to format currency
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact", // Use compact notation like $50M
    maximumFractionDigits: 1,
  }).format(value);
};

// Helper to format numbers
const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
};

const CompanyDetailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const companyId = searchParams.get("id");

  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setError("No company ID provided.");
      setIsLoading(false);
      // Optionally navigate back or show a message
      // navigate('/Companies'); // Navigate back to the list
      return;
    }

    const fetchCompanyDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log(`Fetching details for company ID: ${companyId}`);
        // Path params are passed as first argument, query params as second
        const response = await brain.get_company({ company_id: companyId }); // Pass companyId as path param
        const data = await response.json();
        console.log("Company details received:", data);
        if (data.company) {
          setCompany(data.company);
        } else {
           setError("Company data not found in response.");
        }
      } catch (err: any) {
         console.error("Error fetching company details:", err);
         if (err.status === 404) {
            setError("Company not found.");
         } else {
            setError("Failed to load company details. Please try again later.");
         }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [companyId, navigate]);

  // Define the success handler for the edit form dialog
  const handleUpdateSuccess = (updatedCompany: Company) => {
      console.log("Company updated, refreshing details view...", updatedCompany);
      // Update the local state to show the changes immediately
      setCompany(updatedCompany);
      // Optionally, could also re-fetch: fetchCompanyDetails(); but updating state is smoother
  };

  // Function to get initials for Avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };


  if (isLoading) {
    // Display skeletons while loading
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
         <Skeleton className="h-8 w-32" /> {/* Back button */}
         <Skeleton className="h-12 w-1/2" /> {/* Company Name */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48" /> {/* Company Details Card */}
            <Skeleton className="h-48" /> {/* Contacts Card */}
            <div className="space-y-6">
                <Skeleton className="h-32" /> {/* AI Insights Card */}
                <Skeleton className="h-24" /> {/* Tags Card */}
            </div>
         </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 text-center">
         <Button variant="outline" onClick={() => navigate("/Companies")} className="mb-4">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Companies
         </Button>
        <p className="text-red-600 text-xl">{error}</p>
      </div>
    );
  }

  if (!company) {
     return (
         <div className="container mx-auto p-4 md:p-6 lg:p-8 text-center">
             <Button variant="outline" onClick={() => navigate("/Companies")} className="mb-4">
                 <ArrowLeft className="mr-2 h-4 w-4" /> Back to Companies
             </Button>
             <p>Company data could not be loaded.</p>
         </div>
     );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Back Button */}
       <Button variant="outline" size="sm" onClick={() => navigate("/Companies")} className="mb-4">
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Companies List
       </Button>

      {/* Header Section */}
      <div className="flex items-center space-x-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={company.logoUrl || undefined} alt={`${company.name} logo`} />
          <AvatarFallback className="text-xl">
             {getInitials(company.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1"> {/* Use flex-1 to push button to the right */}
          <h1 className="text-3xl font-bold">{company.name}</h1>
          <p className="text-muted-foreground">{company.industry}</p>
        </div>
         {/* Add Edit Button using Dialog */}
         <CompanyFormDialog
            triggerButton={
                <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-4 w-4"/> Edit
                </Button>
            }
            companyToEdit={company} // Pass the current company data
            onSaveSuccess={handleUpdateSuccess}
         />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Company Details */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center"><Building className="mr-2 h-5 w-5 text-blue-600" /> Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
             <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span>{company.location || "N/A"}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center"><DollarSign className="mr-1 h-4 w-4"/>Revenue:</span>
                <span>{formatCurrency(company.revenue)}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center"><Users className="mr-1 h-4 w-4"/>Employees:</span>
                <span>{formatNumber(company.employees)}</span>
             </div>
             {/* Add more details as needed */}
          </CardContent>
        </Card>

        {/* Column 2: Contacts */}
        <Card className="md:col-span-1">
           <CardHeader>
             <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-blue-600" /> Key Contacts</CardTitle>
           </CardHeader>
           <CardContent>
             {company.contacts && company.contacts.length > 0 ? (
                 <ul className="space-y-4">
                   {company.contacts.map((contact, index) => (
                     <li key={index} className="flex items-center space-x-3">
                       <Avatar className="h-9 w-9">
                           {/* Placeholder for contact image if available */}
                           <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                       </Avatar>
                       <div className="text-sm">
                         <p className="font-medium">{contact.name}</p>
                         <p className="text-xs text-muted-foreground">{contact.title}</p>
                         <a href={`mailto:${contact.email}`} className="text-xs text-blue-600 hover:underline flex items-center">
                           <Mail className="mr-1 h-3 w-3"/> {contact.email}
                         </a>
                       </div>
                     </li>
                   ))}
                 </ul>
               ) : (
                 <p className="text-sm text-muted-foreground">No contacts listed.</p>
               )}
           </CardContent>
        </Card>

        {/* Column 3: Insights & Tags */}
        <div className="md:col-span-1 space-y-6">
           {/* AI Insights Card */}
           <Card>
              <CardHeader>
                 <CardTitle className="flex items-center"><BrainCircuit className="mr-2 h-5 w-5 text-blue-600"/> AI Insights</CardTitle>
                 <CardDescription>Powered by AI (Placeholder for MYA-7)</CardDescription>
              </CardHeader>
              <CardContent>
                 <p className="text-sm text-muted-foreground italic">
                    {company.ai_insights || "AI insights generation pending..."}
                 </p>
                 {/* Add more sophisticated display later */}
              </CardContent>
           </Card>

           {/* Tags Card */}
           <Card>
              <CardHeader>
                 <CardTitle className="flex items-center"><Tag className="mr-2 h-5 w-5 text-blue-600"/> Tags</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                 {company.tags && company.tags.length > 0 ? (
                     company.tags.map((tag, index) => (
                         <Badge key={index} variant="secondary">{tag}</Badge>
                     ))
                 ) : (
                     <p className="text-sm text-muted-foreground">No tags assigned.</p>
                 )}
              </CardContent>
           </Card>
        </div>

      </div> {/* End Grid */}

    </div>
  );
};

export default CompanyDetailPage;
