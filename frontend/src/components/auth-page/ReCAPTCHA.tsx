import React from "react";
import ReCAPTCHA from "react-google-recaptcha";

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

type MyReCAPTCHAProps = {
	captchaRef: React.RefObject<ReCAPTCHA | null>;
};

export default function MyReCAPTCHA({ captchaRef }: MyReCAPTCHAProps) {
	return (
		<div>
			<ReCAPTCHA sitekey={SITE_KEY} ref={captchaRef} />
		</div>
	);
}
