import ClusterPopup from "@/components/UI/ClusterPopup";
import RenderIf from "@/components/UI/Common/RenderIf";
import LoadingSpinner from "@/components/UI/Common/LoadingSpinner";
import Drawer from "@/components/UI/Drawer/Drawer";
import FooterBanner from "@/components/UI/FooterBanner/FooterBanner";
import { CoordinatesURLParametersWithEventType } from "@/mocks/types";
import { dataFetcher } from "@/services/dataFetcher";
import { useMapActions, useCoordinates } from "@/stores/mapStore";
import styles from "@/styles/Home.module.css";
import { BASE_URL } from "@/utils/constants";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import dynamic from "next/dynamic";
import Maintenance from "@/components/UI/Maintenance/Maintenance";
// import { Partytown } from "@builder.io/partytown/react";
import Footer from "@/components/UI/Footer/Footer";
import React, { useEffect, useState } from "react";
import Head from "next/head";

const LeafletMap = dynamic(() => import("@/components/UI/Map"), {
  ssr: false,
});

type Props = {
  deviceType: "mobile" | "desktop";
};

export default function Home({ deviceType }: Props) {
  const [isLoading, setIsloading] = useState(false);
  const [error, setError] = useState(false);

  const [url, setURL] = useState<string | null>(null);
  const coordinatesAndEventType:
    | CoordinatesURLParametersWithEventType
    | undefined = useCoordinates();

  const urlParams = new URLSearchParams({
    ne_lat: coordinatesAndEventType?.ne_lat,
    ne_lng: coordinatesAndEventType?.ne_lng,
    sw_lat: coordinatesAndEventType?.sw_lat,
    sw_lng: coordinatesAndEventType?.sw_lng,
  } as any).toString();

  function handleButtonClick() {
    setURL(BASE_URL + "?" + urlParams);
  }

  useEffect(() => {
    if (
      typeof coordinatesAndEventType === "undefined" ||
      !urlParams ||
      coordinatesAndEventType?.eventType === "moveend" ||
      coordinatesAndEventType?.eventType === "zoomend"
    )
      return;

    setURL(BASE_URL + "?" + urlParams);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinatesAndEventType]);

  const fetchData = (url: string) => {
    if (!url) return;

    setIsloading(true);
    dataFetcher(url || "")
      .then(() => {
        setIsloading(false);
        setError(false);
      })
      .catch(() => {
        setError(true);
        setIsloading(false);
      });
  };

  useEffect(() => {
    fetchData(url || "");
  }, [url]);

  const { setDevice } = useMapActions();
  setDevice(deviceType);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <main className={styles.main}>
        {/* <HelpButton /> FooterBanner'a taşındı */}
        <Container maxWidth={false} disableGutters>
          <RenderIf condition={!error} fallback={<Maintenance />}>
            <LeafletMap />
          </RenderIf>
          {isLoading && <LoadingSpinner slowLoading={false} />}
          <Button
            disabled={isLoading}
            color="secondary"
            variant="contained"
            sx={{
              position: "fixed",
              top: "50px",
              left: "50%",
              marginLeft: "-65.9px",
              zIndex: "9999",
            }}
            onClick={() => handleButtonClick()}
          >
            Bu Alanı Tara
          </Button>
        </Container>
        <Drawer />
        <ClusterPopup />
        <FooterBanner />
        <Footer />
      </main>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const UA = context.req.headers["user-agent"];
  const isMobile = Boolean(
    UA.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  );

  return {
    props: {
      deviceType: isMobile ? "mobile" : "desktop",
    },
  };
}
