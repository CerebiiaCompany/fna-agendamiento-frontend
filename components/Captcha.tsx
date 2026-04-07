"use client";

import dynamic from "next/dynamic";

const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), { ssr: false });
const RECAPTCHA_ENABLED = process.env.NEXT_PUBLIC_ENABLE_RECAPTCHA !== "false";

type Props = {
  onToken: (token: string | null) => void;
};

export default function Captcha({ onToken }: Props) {
  const handleChange = (value: string | null) => {
    onToken(value);
  };

  if (!RECAPTCHA_ENABLED) {
    return null;
  }

  return (
    <div className="mt-4">
      <ReCAPTCHA
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
        onChange={handleChange}
        onExpired={() => onToken(null)}
      />
    </div>
  );
}