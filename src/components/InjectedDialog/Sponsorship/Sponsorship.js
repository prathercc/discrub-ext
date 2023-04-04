import React, { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import SponsorshipStyles from "./Sponsorship.styles";
import HeaderBackground from "./HeaderBackground";
import HeaderTitle from "./HeaderTitle";
import HeaderSummary from "./HeaderSummary";
import HeaderJoinButton from "./HeaderJoinButton";
import { fetchSponsorshipData } from "../../../announcementService";
import classNames from "classnames";
import InfoButton from "./InfoButton";

function Sponsorship() {
  const classes = SponsorshipStyles();
  const [sponsorshipData, setSponsorshipData] = useState(null);

  useEffect(() => {
    const getSponsorshipData = async () => {
      const data = await fetchSponsorshipData();
      setSponsorshipData(data);
    };
    getSponsorshipData();
  }, []);
  return (
    <>
      {sponsorshipData
        ?.filter((s) => !s.hidden)
        ?.map((sponsorship, i) => {
          const { name, description, backgroundImage, url, logoImage } =
            sponsorship;
          return (
            <Stack
              className={classNames(classes.stack, classes[`sponsor${i}`])}
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={2}
            >
              <HeaderBackground
                backgroundImage={backgroundImage}
                logoImage={logoImage}
              />
              <HeaderTitle name={name} />
              <HeaderSummary description={description} />
              <HeaderJoinButton url={url} />
              {!url && <InfoButton />}
            </Stack>
          );
        })}
    </>
  );
}

export default Sponsorship;
