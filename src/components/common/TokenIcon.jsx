export default function TokenIcon({ token }) {
  const logo =
    typeof token.logo === "string" && /^[a-zA-Z0-9_.-]+$/.test(token.logo)
      ? token.logo
      : null;
  return (
    <span className="token-icon" aria-hidden="true">
      <span>{(token.symbol || "?").slice(0, 2)}</span>
      {logo && (
        <img
          key={logo}
          src={`https://assets.thetatoken.org/tokens/${logo}`}
          alt=""
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
    </span>
  );
}
