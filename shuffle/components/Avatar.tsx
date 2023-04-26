const Avatar = ({ url, alt }: { url: string; alt: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img className="inline-block w-8 h-8 rounded-full" src={url} alt={alt} />
);

export default Avatar;
