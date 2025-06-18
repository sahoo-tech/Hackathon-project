from typing import List, Dict, Any

class SensorFusionEngine:
    def __init__(self, weights: Dict[str, float] = None):
        """
        Initialize the sensor fusion engine with optional weights for each sensor type.
        If no weights are provided, equal weighting is assumed.
        """
        self.weights = weights or {}

    def fuse(self, sensor_data_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Fuse multiple sensor data inputs into a unified output.
        This example uses a simple weighted average fusion for numeric readings.
        Non-numeric readings are aggregated in a list.

        Args:
            sensor_data_list: List of sensor data dictionaries.

        Returns:
            A dictionary representing the fused sensor data.
        """
        fused_result = {}
        weight_sum = {}

        for sensor_data in sensor_data_list:
            sensor_type = sensor_data.get("sensor_type", "unknown")
            weight = self.weights.get(sensor_type, 1.0)

            readings = sensor_data.get("readings", {})
            for key, value in readings.items():
                if isinstance(value, (int, float)):
                    if key not in fused_result:
                        fused_result[key] = 0.0
                        weight_sum[key] = 0.0
                    fused_result[key] += value * weight
                    weight_sum[key] += weight
                else:
                    # For non-numeric values, aggregate in a list
                    if key not in fused_result:
                        fused_result[key] = []
                    if isinstance(value, list):
                        fused_result[key].extend(value)
                    else:
                        fused_result[key].append(value)

        # Normalize weighted sums
        for key in fused_result:
            if key in weight_sum and weight_sum[key] > 0:
                fused_result[key] /= weight_sum[key]

        return fused_result
