// Simple SVG-based chart component
const SimpleChart = ({ data, type = 'bar', color = '#2c5530', height = 150 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No data available
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value), 1)
  const width = 100
  const barWidth = width / data.length - 2

  if (type === 'bar') {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 20)
          const x = index * (barWidth + 2) + 1
          const y = height - barHeight - 10
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                opacity="0.7"
                className="hover:opacity-100 transition-opacity"
              />
              <text
                x={x + barWidth / 2}
                y={height - 5}
                textAnchor="middle"
                fontSize="8"
                fill="#666"
              >
                {item.label}
              </text>
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="10"
                fill={color}
                fontWeight="bold"
              >
                {item.value}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  if (type === 'line') {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * (width - 20) + 10
      const y = height - 10 - (item.value / maxValue) * (height - 20)
      return `${x},${y}`
    }).join(' ')

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * (width - 20) + 10
          const y = height - 10 - (item.value / maxValue) * (height - 20)
          return (
            <g key={index}>
              <circle cx={x} cy={y} r="3" fill={color} />
              <text
                x={x}
                y={height - 5}
                textAnchor="middle"
                fontSize="8"
                fill="#666"
              >
                {item.label}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  if (type === 'doughnut') {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = -90
    const radius = 40
    const centerX = width / 2
    const centerY = height / 2

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          const angle = (percentage / 100) * 360
          const startAngle = currentAngle
          const endAngle = currentAngle + angle

          const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
          const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
          const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
          const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180)

          const largeArc = angle > 180 ? 1 : 0

          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ')

          currentAngle = endAngle

          const colors = ['#2c5530', '#4ade80', '#22c55e', '#16a34a', '#15803d']
          const fillColor = colors[index % colors.length]

          return (
            <path
              key={index}
              d={pathData}
              fill={fillColor}
              opacity="0.8"
              className="hover:opacity-100 transition-opacity"
            />
          )
        })}
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          fontSize="14"
          fill="#2c5530"
          fontWeight="bold"
        >
          {total}
        </text>
      </svg>
    )
  }

  return null
}

export default SimpleChart

