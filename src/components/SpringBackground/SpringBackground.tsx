import './SpringBackground.css';

type SpringBackgroundProps = {
  readonly petalCount: number;
};

function getAmbientPetalStyle(index: number) {
  const isEven = index % 2 === 0;

  return {
    '--petal-delay': `${index * 2.15}s`,
    '--petal-left': `${8 + ((index * 17) % 82)}%`,
    '--petal-duration': `${14 + (index % 4) * 2.4}s`,
    '--petal-size': `${9 + (index % 3) * 2}px`,
    '--petal-drift': `${(isEven ? 18 : -20) + index * 1.8}px`,
    '--petal-opacity': `${0.2 + (index % 3) * 0.05}`,
    '--petal-scale': `${0.9 + (index % 4) * 0.08}`,
    '--petal-rotate-start': `${isEven ? -16 : 12}deg`,
    '--petal-rotate-end': `${isEven ? 24 : -20}deg`,
  } as React.CSSProperties;
}

export function SpringBackground({ petalCount }: SpringBackgroundProps) {
  return (
    <div className="spring-background" aria-hidden="true">
      <div className="spring-background__glow spring-background__glow--left" />
      <div className="spring-background__glow spring-background__glow--right" />
      {Array.from({ length: petalCount }).map((_, index) => (
        <span
          key={index}
          className="spring-background__petal"
          style={getAmbientPetalStyle(index)}
        />
      ))}
    </div>
  );
}
