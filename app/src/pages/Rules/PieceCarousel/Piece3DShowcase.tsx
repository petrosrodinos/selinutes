import { Suspense, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { PieceType, PlayerColor } from "../../Game/types";
import { FigureTiers } from "../../../constants/figures";
import { Piece3D, preloadPieceGltfPair } from "../../Game/components/Board3D/Piece3D";

type Piece3DShowcaseProps = {
  pieceType: PieceType;
  playerColor: PlayerColor;
};

type SceneProps = {
  pieceType: PieceType;
  playerColor: PlayerColor;
  onPieceClick: () => void;
};

const Scene = ({ pieceType, playerColor, onPieceClick }: SceneProps) => (
  <>
    <ambientLight intensity={0.6} />
    <directionalLight position={[3, 5, 2]} intensity={1.2} />
    <directionalLight position={[-2, 4, -1]} intensity={0.4} />
    <Piece3D
      type={pieceType}
      color={playerColor}
      tier={FigureTiers.TIER1}
      position={[0, 0, 0]}
      isSelected={false}
      isHint={false}
      isTargeted={false}
      isSwapTarget={false}
      onClick={onPieceClick}
      rulesPreview
    />
    <OrbitControls
      enableRotate={true}
      enableZoom={true}
      enablePan={false}
      minDistance={1}
      maxDistance={3.5}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      target={[0, 0.5, 0]}
    />
  </>
);

export const Piece3DShowcase = ({ pieceType, playerColor }: Piece3DShowcaseProps) => {
  const onPieceClick = useCallback(() => {}, []);

  useEffect(() => {
    preloadPieceGltfPair(pieceType);
  }, [pieceType]);

  return (
    <div className="w-full h-[240px] rounded-xl overflow-hidden bg-[#1c1917] border border-stone-700/50 [&_canvas]:block">
      <Canvas
        key={`${pieceType}-${playerColor}`}
        camera={{ position: [0, 0.5, 2.15], fov: 45 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.25]}
        style={{ height: "100%", width: "100%", display: "block" }}
      >
        <color attach="background" args={["#1c1917"]} />
        <Suspense fallback={null}>
          <Scene pieceType={pieceType} playerColor={playerColor} onPieceClick={onPieceClick} />
        </Suspense>
      </Canvas>
    </div>
  );
};
