
import React from 'react';
import Svg, { Polygon } from 'react-native-svg';
import { View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const BottomPattern = ({ height = 150, color = "#FFFFFF" }: { height?: number, color?: string }) => {
    const { width } = Dimensions.get('window');
    // Grid of triangles
    // We want triangles at the bottom (high Y) to be visible, and top (low Y) to fade out.
    // Rows: let's say 10 rows.
    const triangleSize = 16;
    const gap = 12;
    const rows = 8;
    const elements = [];

    for (let r = 0; r < rows; r++) {
        const y = r * (triangleSize * 0.866 + 4); // roughly height of equilateral triangle + gap
        // Opacity: top row (r=0) should be near 0. Bottom row (r=rows-1) near 1.
        const opacity = Math.pow((r + 1) / rows, 2) * 0.4; // Quadratic fade for smoothness, max 0.4 opacity

        const cols = Math.ceil(width / (triangleSize + gap)) + 1;

        for (let c = 0; c < cols; c++) {
            const xOffset = (r % 2) * ((triangleSize + gap) / 2);
            const x = c * (triangleSize + gap) + xOffset - 20;
            elements.push(
                <Polygon
                    key={`${r}-${c}`}
                    points={`${x},${y + triangleSize} ${x + triangleSize},${y + triangleSize} ${x + triangleSize / 2},${y}`}
                    fill={color}
                    fillOpacity={opacity}
                />
            );
        }
    }

    return (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: rows * 25 + 20, zIndex: -1 }}>
            <Svg height="100%" width="100%" style={{ opacity: 0.8 }}>
                {elements}
            </Svg>
        </View>
    );
};

export default BottomPattern;
