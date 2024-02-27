"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { QrCodeIcon } from "lucide-react";
import { Button } from "../shadcn/ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
} from "../shadcn/ui/dialog";

export const QrCodeGenerator = () => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  return (
    <>
      <div
        className="rounded-full bg-zinc-600 hover:bg-zinc-500 text-white text-xs px-2 py-[6px] cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <QrCodeIcon className="inline w-3 h-3 mr-2" />
        QR Code
      </div>

      <Dialog open={open}>
        <DialogContent
          className="sm:max-w-[800px] gap-6 max-h-full overflow-auto text-zinc-100"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl">QR Code</DialogTitle>
          </DialogHeader>

          <div>
            <div
              style={{
                height: "auto",
                margin: "0 auto",
                maxWidth: 1400,
                width: "100%",
              }}
            >
              <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={url}
                viewBox="0 0 256 256"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
