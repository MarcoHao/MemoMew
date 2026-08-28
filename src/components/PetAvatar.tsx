import React, { useRef, useEffect, useState } from 'react';

type PetState = 'idle' | 'listen' | 'think' | 'speak' | 'happy';

interface PetAvatarProps {
  state: PetState;
  size?: 'sm' | 'md' | 'lg';
}

const PetAvatar: React.FC<PetAvatarProps> = ({ state, size = 'md' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frame, setFrame] = useState(0);
  const frameRef = useRef(0);

  const sizeMap = { sm: 48, md: 64, lg: 120 };
  const s = sizeMap[size];

  // Animation frame loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      frameRef.current += 1;
      setFrame(frameRef.current);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Draw pet on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const t = frame;

    ctx.clearRect(0, 0, w, h);

    // Center position
    const cx = w / 2;
    const cy = h / 2 + 4;
    const scale = s / 64;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // Animation params based on state
    let bounceY = 0;
    let earRotL = 0;
    let earRotR = 0;
    let tailWag = 0;
    let eyeOpen = 1;
    let mouthOpen = 0;
    let blushAlpha = 0;

    switch (state) {
      case 'idle':
        bounceY = Math.sin(t * 0.05) * 2;
        earRotL = Math.sin(t * 0.03) * 0.05;
        earRotR = Math.sin(t * 0.03 + 1) * 0.05;
        tailWag = Math.sin(t * 0.04) * 0.3;
        break;
      case 'listen':
        bounceY = 0;
        earRotL = -0.2 + Math.sin(t * 0.1) * 0.1;
        earRotR = -0.2 + Math.sin(t * 0.1 + 0.5) * 0.1;
        eyeOpen = 1;
        break;
      case 'think':
        bounceY = Math.sin(t * 0.1) * 1;
        earRotL = 0.1;
        earRotR = -0.1;
        eyeOpen = 0.6 + Math.sin(t * 0.08) * 0.1;
        tailWag = Math.sin(t * 0.06) * 0.1;
        break;
      case 'speak':
        bounceY = Math.sin(t * 0.15) * 3;
        mouthOpen = 0.3 + Math.sin(t * 0.2) * 0.2;
        earRotL = Math.sin(t * 0.1) * 0.1;
        earRotR = Math.sin(t * 0.1 + 1) * 0.1;
        break;
      case 'happy':
        bounceY = Math.sin(t * 0.12) * 4;
        earRotL = -0.3;
        earRotR = -0.3;
        tailWag = Math.sin(t * 0.15) * 0.8;
        eyeOpen = 0.3;
        blushAlpha = 0.5;
        break;
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.ellipse(0, 22 + bounceY * 0.3, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.save();
    ctx.translate(16, 12 + bounceY);
    ctx.rotate(tailWag);
    ctx.fillStyle = '#f4a261';
    ctx.beginPath();
    ctx.ellipse(8, -8, 4, 12, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Body
    ctx.fillStyle = '#f4a261';
    ctx.beginPath();
    ctx.ellipse(0, 8 + bounceY, 16, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // White belly
    ctx.fillStyle = '#fff5e6';
    ctx.beginPath();
    ctx.ellipse(0, 10 + bounceY, 10, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#f4a261';
    ctx.beginPath();
    ctx.arc(0, -6 + bounceY, 16, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    // Left ear
    ctx.save();
    ctx.translate(-10, -16 + bounceY);
    ctx.rotate(earRotL - 0.3);
    ctx.fillStyle = '#f4a261';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-8, -14);
    ctx.lineTo(6, -4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e76f51';
    ctx.beginPath();
    ctx.moveTo(-1, -2);
    ctx.lineTo(-5, -10);
    ctx.lineTo(3, -4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Right ear
    ctx.save();
    ctx.translate(10, -16 + bounceY);
    ctx.rotate(earRotR + 0.3);
    ctx.fillStyle = '#f4a261';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(8, -14);
    ctx.lineTo(-6, -4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e76f51';
    ctx.beginPath();
    ctx.moveTo(1, -2);
    ctx.lineTo(5, -10);
    ctx.lineTo(-3, -4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Eyes
    const eyeY = -8 + bounceY;
    if (state === 'happy') {
      ctx.strokeStyle = '#264653';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-6, eyeY + 1, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(6, eyeY + 1, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      const eyeH = 5 * eyeOpen;
      ctx.fillStyle = '#264653';
      ctx.beginPath();
      ctx.ellipse(-6, eyeY, 4, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(6, eyeY, 4, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();

      if (eyeOpen > 0.5) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-5, eyeY - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(7, eyeY - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Nose
    ctx.fillStyle = '#e76f51';
    ctx.beginPath();
    ctx.moveTo(0, -2 + bounceY);
    ctx.lineTo(-3, 2 + bounceY);
    ctx.lineTo(3, 2 + bounceY);
    ctx.closePath();
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#264653';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (mouthOpen > 0.1) {
      ctx.fillStyle = '#e76f51';
      ctx.beginPath();
      ctx.arc(0, 4 + bounceY, 4 + mouthOpen * 3, 0, Math.PI);
      ctx.fill();
    } else {
      ctx.arc(-3, 3 + bounceY, 3, 0.1, Math.PI - 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(3, 3 + bounceY, 3, 0.1, Math.PI - 0.1);
      ctx.stroke();
    }

    // Whiskers
    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-12, 0 + bounceY);
    ctx.lineTo(-22, -2 + bounceY);
    ctx.moveTo(-12, 3 + bounceY);
    ctx.lineTo(-22, 4 + bounceY);
    ctx.moveTo(12, 0 + bounceY);
    ctx.lineTo(22, -2 + bounceY);
    ctx.moveTo(12, 3 + bounceY);
    ctx.lineTo(22, 4 + bounceY);
    ctx.stroke();

    // Blush
    if (blushAlpha > 0) {
      ctx.fillStyle = `rgba(231, 111, 81, ${blushAlpha})`;
      ctx.beginPath();
      ctx.ellipse(-10, 0 + bounceY, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(10, 0 + bounceY, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Paws
    ctx.fillStyle = '#f4a261';
    ctx.beginPath();
    ctx.ellipse(-10, 20 + bounceY, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(10, 20 + bounceY, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, [frame, state, s]);

  return (
    <canvas
      ref={canvasRef}
      width={s}
      height={s}
      style={{ imageRendering: 'pixelated' }}
      className="rounded-full"
    />
  );
};

export default PetAvatar;
