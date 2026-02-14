import { getCarById } from "@/actions/car-listing";
import { notFound } from "next/navigation";
// Add '../' to go up one folder level
import { TestDriveForm } from "../_components/test-drive-forms";
export async function generateMetadata() {
  return {
    title: `Book Test Drive | Smart Wheels`,
    description: `Schedule a test drive in a few seconds`,
  };
}

export default async function TestDrivePage({ params }) {
  // Await params and use 'idd' to match your folder [idd]
  const { idd } = await params; 
  const result = await getCarById(idd); 

  if (!result || !result.success) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-6xl mb-6 gradient-title">Book a Test Drive</h1>
      <TestDriveForm
        car={result.data}
        testDriveInfo={result.data.testDriveInfo}
      />
    </div>
  );
}