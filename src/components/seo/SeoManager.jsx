import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getSeoForPath, SITE_NAME } from "../../config/seo";

function upsertMetaTag(attributeName, attributeValue, content) {
  let element = document.head.querySelector(
    `meta[${attributeName}="${attributeValue}"]`
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function updateCanonicalLink(href) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!href) {
    if (link) {
      link.remove();
    }
    return;
  }
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

export default function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = getSeoForPath(pathname);

    document.title = seo.title;

    upsertMetaTag("name", "description", seo.description);
    upsertMetaTag("name", "robots", seo.robots);
    updateCanonicalLink(seo.canonical);

    upsertMetaTag("property", "og:type", seo.ogType || "website");
    upsertMetaTag("property", "og:site_name", SITE_NAME);
    upsertMetaTag("property", "og:locale", "id_ID");
    upsertMetaTag("property", "og:title", seo.title);
    upsertMetaTag("property", "og:description", seo.description);
    if (seo.canonical) {
      upsertMetaTag("property", "og:url", seo.canonical);
    } else {
      const ogUrl = document.head.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.remove();
    }
    upsertMetaTag("property", "og:image", seo.ogImage);
    upsertMetaTag("property", "og:image:alt", seo.ogImageAlt);

    upsertMetaTag("name", "twitter:card", "summary_large_image");
    upsertMetaTag("name", "twitter:title", seo.title);
    upsertMetaTag("name", "twitter:description", seo.description);
    upsertMetaTag("name", "twitter:image", seo.ogImage);
    upsertMetaTag("name", "twitter:image:alt", seo.ogImageAlt);
  }, [pathname]);

  return null;
}
