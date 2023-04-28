import React from "react";
import { TwitterShareButton, TwitterIcon } from "react-share";

interface TwitterShareProps {
  url: string;
  title: string;
  hashtags?: string[];
  size?: number;
}

const TwitterShare: React.FC<TwitterShareProps> = ({
  url,
  title,
  hashtags,
  size = 32,
}) => (
  <TwitterShareButton url={url} title={title} hashtags={hashtags}>
    <div className="flex items-center mt-10 px-3 py-2 border border-[#4da9e7] text-[#4da9e7] rounded-lg hover:bg-blue-900 hover:text-white hover:border-white">
      <TwitterIcon size={size} round className="mr-2" /> Share on Twitter
    </div>
  </TwitterShareButton>
);

export default TwitterShare;
