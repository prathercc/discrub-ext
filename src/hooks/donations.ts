import { useEffect, useState } from "react";
import { Donation, fetchDonationData } from "../services/github-service.ts";

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    const getDonationData = async () => {
      const data = await fetchDonationData();
      setDonations(data);
    };
    getDonationData();
  }, []);

  return donations;
}
