/**
 * IconWrapper — used in sidebar nav and dashboard cards.
 * Keeps a consistent size/centering contract across the app.
 * All color logic defers to CSS vars so it works in both themes.
 */
const IconWrapper = ({
  icon: Icon,
  active = false,
  className = '',
  wrapperSize = 40,
  iconSize = 16,
  colorOverride = false,
}) => {
  const baseStyle = {
    width: wrapperSize,
    height: wrapperSize,
    flexShrink: 0,
  }

  const activeStyle = {
    background: 'var(--text-primary)',
    color: 'var(--bg-app)',
    border: '1px solid var(--border-subtle)',
  }

  const inactiveStyle = {
    background: 'var(--bg-surface)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-subtle)',
  }

  return (
    <div
      className={`flex items-center justify-center rounded-xl transition-colors duration-150 ${className}`}
      style={{
        ...baseStyle,
        ...(colorOverride ? {} : active ? activeStyle : inactiveStyle),
      }}
    >
      <Icon
        size={iconSize}
        strokeWidth={active ? 2.5 : 1.8}
        stroke="currentColor"
      />
    </div>
  )
}

export default IconWrapper
