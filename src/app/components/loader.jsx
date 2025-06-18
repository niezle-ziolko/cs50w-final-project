export default function Loader() {
  return (
    <div className="w-1 h-2 absolute">
      <div className="loader-bar" style={{ '--rotation': '36deg', animationDelay: '0.1s', transform: 'rotate(36deg) translate(0, 150%)'}} />
      <div className="loader-bar" style={{ '--rotation': '72deg', animationDelay: '0.2s', transform: 'rotate(72deg) translate(0, 150%)'}} />
      <div className="loader-bar" style={{ '--rotation': '108deg', animationDelay: '0.3s', transform: 'rotate(108deg) translate(0, 150%)'}} />
      <div className="loader-bar" style={{ '--rotation': '144deg', animationDelay: '0.4s', transform: 'rotate(144deg) translate(0, 150%)'}} />
      <div className="loader-bar" style={{ '--rotation': '180deg', animationDelay: '0.5s', transform: 'rotate(180deg) translate(0, 150%)'}} />
      <div className="loader-bar" style={{ '--rotation': '216deg', animationDelay: '0.6s', transform: 'rotate(216deg) translate(0, 150%)'}} />
      <div className="loader-bar" style={{ '--rotation': '252deg', animationDelay: '0.7s', transform: 'rotate(252deg) translate(0, 150%)'}} />
      <div className="loader-bar" style={{ '--rotation': '288deg', animationDelay: '0.8s', transform: 'rotate(288deg) translate(0, 150%)'}} />
      <div className="loader-bar" style={{ '--rotation': '324deg', animationDelay: '0.9s', transform: 'rotate(324deg) translate(0, 150%)'}} />
      <div className="loader-bar" style={{ '--rotation': '366deg', animationDelay: '1s', transform: 'rotate(366deg) translate(0, 150%)'}} />
    </div>
  );
};