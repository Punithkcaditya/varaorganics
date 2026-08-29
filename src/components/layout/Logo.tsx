import Link from "next/link";

/** Official supplied Vara wordmark, cropped non-destructively inside its link. */
export function Logo() {
  return (
    <Link
      href="/"
      className="block h-10 w-32 shrink-0 overflow-hidden"
      aria-label="Vara Organics — home"
    >
      <span
        aria-hidden="true"
        className="block h-full w-full bg-no-repeat mix-blend-multiply"
        style={{
          backgroundImage: "url('/brand/varaorganic.png')",
          backgroundPosition: "45.5% 50%",
          backgroundSize: "190% auto",
        }}
      />
    </Link>
  );
}
