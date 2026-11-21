import { OtpGroup, OtpInput, OtpSlot } from "@odyssey/ui/otp-input";
import { createRoot } from "react-dom/client";

createRoot(document.body).render(<OtpInput aria-label="Code" maxLength={1}><OtpGroup><OtpSlot index={0} /></OtpGroup></OtpInput>);
