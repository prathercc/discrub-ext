const GITHUB_GIST_URL = "https://api.github.com/gists";
const ANNOUNCEMENT_ENDPOINT = `${GITHUB_GIST_URL}/912abef788d8f6dc25b3f4e0fa5e6371`;
const DONATION_ENDPOINT = `${GITHUB_GIST_URL}/2aca7928b4db1ab84eac3720ac8e8559`;
const ANNOUNCEMENT_MARKDOWN_ENDPOINT = `${GITHUB_GIST_URL}/5b230f045a910b6b6501e67c9c4d2f3f`;

export type Announcement = {
  rev: string;
  ff_rev: string;
  pop_ver: string;
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
        gistData?.files?.["announcement.json"]?.content,
      );
      return announcement;
    })
    .catch((e) => console.error("Error fetching announcement data", e));
};

export const fetchAnnouncementMarkdown = (): Promise<string> => {
  return fetch(ANNOUNCEMENT_MARKDOWN_ENDPOINT, {
    method: "GET",
    headers: {
      "Content-Type": "application/text",
    },
  })
    .then(async (resp) => {
      const gistData = await resp.json();
      const markdown = gistData?.files?.["announcement_markdown.md"]?.content;
      return markdown;
    })
    .catch((e) => {
      console.error("Error fetching announcement markdown", e);
      return "";
    });
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
