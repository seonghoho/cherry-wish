import './SpringBackground.css';

type SpringBackgroundProps = {
  readonly petalCount: number;
};

export function SpringBackground({ petalCount }: SpringBackgroundProps) {
  return (
    <div className="spring-background" aria-hidden="true">
      <div className="spring-background__glow spring-background__glow--left" />
      <div className="spring-background__glow spring-background__glow--right" />
      {Array.from({ length: petalCount }).map((_, index) => (
        <span
          key={index}
          className="spring-background__petal"
          style={
            {
              '--petal-delay': `${index * 1.8}s`,
              '--petal-left': `${16 + index * 26}%`,
              '--petal-duration': `${15 + index * 2.6}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
