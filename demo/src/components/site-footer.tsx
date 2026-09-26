import ExternalLink from "./external-link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        <ExternalLink href="https://www.npmjs.com/package/statinfer">statinfer</ExternalLink> is{" "}
        <ExternalLink href="https://github.com/leehart3000/statinfer">open source</ExternalLink> under the{" "}
        <ExternalLink href="https://github.com/leehart3000/statinfer/blob/main/LICENSE">
          Apache 2.0 licence
        </ExternalLink>
        .
      </p>
    </footer>
  );
}