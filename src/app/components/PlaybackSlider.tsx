type PlaybackSliderProps = {
  sliderPosition: number;
};

export default function PlaybackSlider({
  sliderPosition,
}: PlaybackSliderProps) {
  return (
    <div
      className="slider"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: `${sliderPosition}%`,
        width: "0.25rem",
        backgroundColor: "rgba(161, 125, 238, 1)",
        borderRadius: "0.2rem",
        border: "0.02rem solid rgb(209, 190, 251)",
        boxShadow: "0rem 0rem 1.5rem 0.5rem rgba(157, 154, 171, 0.57)",
        transition: "left 0.02s linear",
        zIndex: 10,
      }}
    />
  );
}
