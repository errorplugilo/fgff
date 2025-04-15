// ui/src/components/CompanyForm.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import brain from "brain";
import { Company } from "types"; // Assuming Company type includes all fields
import { toast } from "sonner"; // For notifications

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Define the validation schema using Zod
// Making fields optional for update, but required for create is handled in submit logic or props
// For simplicity here, let's define the core shape. Adjust requirements based on API.
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  industry: z.string().min(2, {
    message: "Industry must be at least 2 characters.",
  }),
  location: z.string().min(2, {
      message: "Location must be at least 2 characters.",
  }),
  logoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')), // Optional but must be URL if provided
  revenue: z.coerce.number().int().positive().optional().nullable(), // Optional positive integer
  employees: z.coerce.number().int().positive().optional().nullable(), // Optional positive integer
});

type FormSchemaType = z.infer<typeof formSchema>;

interface Props {
  companyToEdit?: Company | null; // Pass existing company data for editing
  onSaveSuccess: (savedCompany: Company) => void; // Callback after successful save
  onCancel?: () => void; // Optional callback for cancel action
}

export const CompanyForm: React.FC<Props> = ({
  companyToEdit,
  onSaveSuccess,
  onCancel,
}) => {
  const isEditMode = !!companyToEdit;

  // 1. Define your form.
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      industry: "",
      location: "",
      logoUrl: "",
      revenue: null,
      employees: null,
      // Initialize form with existing data if in edit mode
      ...(companyToEdit ? {
          name: companyToEdit.name || "",
          industry: companyToEdit.industry || "",
          location: companyToEdit.location || "",
          logoUrl: companyToEdit.logoUrl || "",
          revenue: companyToEdit.revenue || null,
          employees: companyToEdit.employees || null,
      } : {}),
    },
  });

   // Reset form if companyToEdit changes (e.g., opening dialog for different company)
   useEffect(() => {
     if (companyToEdit) {
       form.reset({
         name: companyToEdit.name || "",
         industry: companyToEdit.industry || "",
         location: companyToEdit.location || "",
         logoUrl: companyToEdit.logoUrl || "",
         revenue: companyToEdit.revenue || null,
         employees: companyToEdit.employees || null,
       });
     } else {
        form.reset({ // Reset to defaults for create mode
            name: "",
            industry: "",
            location: "",
            logoUrl: "",
            revenue: null,
            employees: null,
        });
     }
   }, [companyToEdit, form]);


  // 2. Define a submit handler.
  async function onSubmit(values: FormSchemaType) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log("Form submitted:", values);
    const savingToast = toast.loading(isEditMode ? "Updating company..." : "Creating company...");

    try {
        let response;
        let savedCompanyData;

        // Prepare payload, converting empty strings/nulls appropriately if needed by API
        const payload = {
            ...values,
            logoUrl: values.logoUrl || null, // Ensure null if empty string
            // Revenue/Employees might need explicit null check depending on API model
            revenue: values.revenue === 0 ? 0 : values.revenue || null,
            employees: values.employees === 0 ? 0 : values.employees || null,
        };

        if (isEditMode && companyToEdit?.id) {
            console.log(`Calling update_company for ID: ${companyToEdit.id}`);
            // Pass path param and body
            response = await brain.update_company({ company_id: companyToEdit.id }, payload);
        } else {
            console.log("Calling create_company");
            response = await brain.create_company(payload); // Pass body directly
        }

        const result = await response.json();
        console.log("API response:", result);

        if (result.company) {
           savedCompanyData = result.company;
           toast.success(`Company ${isEditMode ? 'updated' : 'created'} successfully!`, { id: savingToast });
           onSaveSuccess(savedCompanyData); // Call the success callback
        } else {
             throw new Error("Unexpected response structure from API.");
        }

    } catch (error: any) {
      console.error("Failed to save company:", error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} company. ${error.message || ""}`, { id: savingToast });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name *</FormLabel>
              <FormControl>
                <Input placeholder="Acme Corporation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Industry */}
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry *</FormLabel>
              <FormControl>
                <Input placeholder="Technology" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location *</FormLabel>
              <FormControl>
                <Input placeholder="San Francisco, CA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Logo URL */}
        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/logo.png" {...field} />
              </FormControl>
              <FormDescription>Optional: URL of the company logo.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Revenue */}
          <FormField
            control={form.control}
            name="revenue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Revenue (USD)</FormLabel>
                <FormControl>
                  {/* Input type="number" can be tricky, ensure coercion works */}
                  <Input type="number" placeholder="50000000" {...field} onChange={event => field.onChange(+event.target.value)} />
                </FormControl>
                 <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Employees */}
          <FormField
            control={form.control}
            name="employees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Employees</FormLabel>
                <FormControl>
                   <Input type="number" placeholder="250" {...field} onChange={event => field.onChange(+event.target.value)}/>
                </FormControl>
                 <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

         {/* Buttons */}
         <div className="flex justify-end gap-2 pt-4">
             {onCancel && (
                 <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                 </Button>
             )}
             <Button type="submit" disabled={form.formState.isSubmitting}>
               {form.formState.isSubmitting ? 'Saving...' : (isEditMode ? 'Update Company' : 'Create Company')}
             </Button>
         </div>
      </form>
    </Form>
  );
};
