// ui/src/components/CompanyFormDialog.tsx
import React, { useState } from "react";
import { Company } from "types";
import { CompanyForm } from "./CompanyForm"; // Import the form component

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  // DialogFooter, // Footer content might be handled within the form's buttons
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react"; // Icons for trigger buttons

interface Props {
  triggerButton: React.ReactNode; // Allow custom trigger button (e.g., text, icon)
  companyToEdit?: Company | null;
  onSaveSuccess: (savedCompany: Company) => void; // Callback needed by CompanyForm
}

export const CompanyFormDialog: React.FC<Props> = ({
  triggerButton,
  companyToEdit,
  onSaveSuccess,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isEditMode = !!companyToEdit;

  const handleSaveSuccess = (savedCompany: Company) => {
    onSaveSuccess(savedCompany); // Pass the success event up
    setIsOpen(false); // Close dialog on successful save
  };

  const handleCancel = () => {
    setIsOpen(false); // Close dialog on cancel
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]"> {/* Adjust width as needed */}
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Company" : "Add New Company"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update the details for ${companyToEdit?.name}. Click save when you're done.`
              : "Enter the details for the new company. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>

        {/* Render the actual form inside */}
        <div className="py-4">
           <CompanyForm
             companyToEdit={companyToEdit}
             onSaveSuccess={handleSaveSuccess}
             onCancel={handleCancel}
           />
        </div>

        {/* Footer is handled by the form's buttons, but DialogClose can be used if needed */}
        {/* <DialogFooter> */}
          {/* Buttons are inside CompanyForm now */}
        {/* </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};

// Example Usage (will be used in Companies.tsx and CompanyDetail.tsx)
/*
<CompanyFormDialog
  triggerButton={<Button><Plus className="mr-2 h-4 w-4" /> Add Company</Button>}
  onSaveSuccess={(company) => console.log("Saved:", company)}
/>

<CompanyFormDialog
  triggerButton={<Button variant="outline" size="sm"><Pencil className="mr-2 h-4 w-4"/> Edit</Button>}
  companyToEdit={existingCompanyData}
  onSaveSuccess={(company) => console.log("Updated:", company)}
/>
*/
