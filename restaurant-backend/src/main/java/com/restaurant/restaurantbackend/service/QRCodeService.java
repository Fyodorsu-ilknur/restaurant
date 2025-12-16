package com.restaurant.restaurantbackend.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class QRCodeService {

    // Frontend URL'i - application.properties'den alınacak
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private static final int QR_CODE_SIZE = 300;
    private static final String IMAGE_FORMAT = "PNG";

    /**
     * Masa ID'sine göre QR kod oluşturur
     * QR kod içinde frontend menü sayfasının URL'i bulunur
     * 
     * @param tableId Masa ID'si
     * @return QR kod görseli (byte array olarak)
     */
    public byte[] generateQRCode(Long tableId) throws WriterException, IOException {
        // QR kod içeriği: Frontend menü sayfası URL'i + masa ID
        String qrContent = frontendUrl + "/menu?tableId=" + tableId;
        
        return generateQRCodeImage(qrContent);
    }

    /**
     * Verilen içerik için QR kod görseli oluşturur
     * 
     * @param content QR kod içeriği
     * @return QR kod görseli (byte array olarak)
     */
    public byte[] generateQRCodeImage(String content) throws WriterException, IOException {
        // QR kod yazıcı oluştur
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        
        // QR kod ayarları
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 1);

        // QR kod matrisi oluştur
        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, QR_CODE_SIZE, QR_CODE_SIZE, hints);

        // BitMatrix'i BufferedImage'e dönüştür
        BufferedImage qrImage = new BufferedImage(QR_CODE_SIZE, QR_CODE_SIZE, BufferedImage.TYPE_INT_RGB);
        qrImage.createGraphics();

        Graphics2D graphics = (Graphics2D) qrImage.getGraphics();
        graphics.setColor(Color.WHITE);
        graphics.fillRect(0, 0, QR_CODE_SIZE, QR_CODE_SIZE);
        graphics.setColor(Color.BLACK);

        // QR kod piksellerini çiz
        for (int i = 0; i < QR_CODE_SIZE; i++) {
            for (int j = 0; j < QR_CODE_SIZE; j++) {
                if (bitMatrix.get(i, j)) {
                    graphics.fillRect(i, j, 1, 1);
                }
            }
        }

        // BufferedImage'i byte array'e dönüştür
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(qrImage, IMAGE_FORMAT, baos);
        
        return baos.toByteArray();
    }

    /**
     * QR kod içeriğini döndürür (test için)
     */
    public String getQRCodeContent(Long tableId) {
        return frontendUrl + "/menu?tableId=" + tableId;
    }
}

