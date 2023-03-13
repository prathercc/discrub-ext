export const fetchAnnouncementData = () => {
  return fetch(
    `https://api.github.com/gists/912abef788d8f6dc25b3f4e0fa5e6371`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then(async (resp) => {
      const gistData = await resp.json();
      const announcement = JSON.parse(
        gistData.files["announcement.json"]?.content
      );
      return announcement;
    })
    .catch((e) => console.error("Error fetching announcement", e));
};
export const fetchDonationData = () => {
  return fetch(
    `https://api.github.com/gists/2aca7928b4db1ab84eac3720ac8e8559`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then(async (resp) => {
      const gistData = await resp.json();
      const donation = JSON.parse(gistData.files["donation.json"]?.content);
      return donation;
    })
    .catch((e) => console.error("Error fetching donation", e));
};
