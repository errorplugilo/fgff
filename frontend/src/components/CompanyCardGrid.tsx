// ui/src/components/CompanyCardGrid.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Company } from "types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"; // Use badge for industry maybe

interface Props {
  company: Company;
}

// Function to get initials for Avatar fallback
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export const CompanyCardGrid: React.FC<Props> = ({ company }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/CompanyDetail?id=${company.id}`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between h-full" // Ensure card takes full height for grid consistency
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
         <Avatar className="h-12 w-12">
           <AvatarImage src={company.logoUrl || undefined} alt={`${company.name} logo`} />
           <AvatarFallback className="text-lg">{getInitials(company.name)}</AvatarFallback>
         </Avatar>
         <div className="flex-1">
           <CardTitle className="text-lg font-semibold leading-tight">{company.name}</CardTitle>
           <CardDescription className="text-xs">{company.location || "Location not specified"}</CardDescription>
         </div>
      </CardHeader>
      <CardContent className="pt-2">
        {/* <p className="text-sm text-muted-foreground mb-2">{company.industry}</p> */}
         <Badge variant="secondary">{company.industry || "N/A"}</Badge>
         {/* Add more details like tags or employee count if needed/space permits */}
         {/* Example: */}
         {/* <div className="mt-2 flex flex-wrap gap-1">
             {company.tags?.slice(0, 2).map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
         </div> */}
      </CardContent>
      {/* Optional Footer */}
      {/* <CardFooter>
          <Button variant="ghost" size="sm">View Details</Button>
      </CardFooter> */}
    </Card>
  );
};
