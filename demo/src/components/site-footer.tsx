import ExternalLink from "./external-link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        Every function and option is described in the{" "}
        <ExternalLink href="https://leehart3000.github.io/statinfer/">API documentation</ExternalLink>.
      </p>
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