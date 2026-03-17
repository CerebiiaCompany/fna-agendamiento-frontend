"use client";

import ReCAPTCHA from "react-google-recaptcha";

type Props = {
  onToken: (token: string | null) => void;
};

export default function Captcha({ onToken }: Props) {
  const handleChange = (value: string | null) => {
    onToken(value);
  };

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