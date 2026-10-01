import { useEffect, useRef } from "react";
import { addEventListener, getInitialURL, parse } from "expo-linking";
import { useLinkTo } from "@react-navigation/native";

import { useAuth } from "../../contexts";
import { logger } from "../../utils";

export const DeepLinkHandler = () => {
  const linkTo = useLinkTo();
  const { user, isLoading } = useAuth();
  const pendingUrlRef = useRef<string | null>(null);
  const isReadyRef = useRef(false);

  useEffect(() => {
    getInitialURL().then((url) => {
      if (url) pendingUrlRef.current = url;
      isReadyRef.current = true;
      flush();
    });

    const sub = addEventListener("url", ({ url }) => {
      pendingUrlRef.current = url;
      flush();
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    flush();
  }, [user?.id, isLoading]);

  const flush = () => {
    const url = pendingUrlRef.current;
    if (!url) return;

    if (!user) return;
    if (!isReadyRef.current) return;

    pendingUrlRef.current = null;

    const { path } = parse(url);
    if (!path) return;

    const target = "/" + path;
    void logger.debug("Deep link navigate", { url, target });

    setTimeout(() => {
      try {
        linkTo(target);
      } catch (e) {
        void logger.warn("Deep link failed", {
          url,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }, 0);
  };

  return null;
};
