const GITHUB_GIST_URL = "https://api.github.com/gists";
const ANNOUNCEMENT_ENDPOINT = `${GITHUB_GIST_URL}/912abef788d8f6dc25b3f4e0fa5e6371`;
const DONATION_ENDPOINT = `${GITHUB_GIST_URL}/2aca7928b4db1ab84eac3720ac8e8559`;

export type Announcement = {
  date: string;
  title: string;
  message: string;
};
export const fetchAnnouncementData = (): Promise<Announcement> => {
  return fetch(ANNOUNCEMENT_ENDPOINT, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (resp) => {
      const gistData = await resp.json();
      const announcement = JSON.parse(
        gistData.files["announcement.json"]?.content
      );
      return announcement;
    })
    .catch((e) => console.error("Error fetching announcement", e));
};

export type Donation = {
  amount: number;
  dollars: number;
  name: string;
  date: string;
  message: string;
};
export const fetchDonationData = (): Promise<Donation[]> => {
  return fetch(DONATION_ENDPOINT, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (resp) => {
      const gistData = await resp.json();
      const donation = JSON.parse(gistData.files["donation.json"]?.content);
      return donation;
    })
    .catch((e) => console.error("Error fetching donations", e));
};
