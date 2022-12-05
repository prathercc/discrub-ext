export const fetchAnnouncementData = (authorization) => {
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
