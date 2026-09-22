# Generates gfr-indexing.png — the BSA de-indexing surface for the elimination page.
#
# Run from the repo root:  Rscript docs/concepts/images/gfr-indexing.R
#
# The output PNG is committed. This script is NOT executed at build time: the
# page carries no code cells, which keeps it out of Quarto's freeze cache and
# therefore out of the "Netlify has no R" failure mode. Source sits beside the
# image, the same way the .excalidraw files do.

library(ggplot2)

# Du Bois & Du Bois (1916): BSA (m^2) = 0.007184 * W^0.425 * H^0.725, W in kg, H in cm
bsa_dubois <- function(height_cm, weight_kg) {
  0.007184 * weight_kg^0.425 * height_cm^0.725
}

# weight on the contour where the multiplier takes a given value, at a given height
weight_at <- function(multiplier, height_cm) {
  ((multiplier * 1.73) / (0.007184 * height_cm^0.725))^(1 / 0.425)
}

# and the inverse, for labelling the contours that leave through the left edge
height_at <- function(multiplier, weight_kg) {
  ((multiplier * 1.73) / (0.007184 * weight_kg^0.425))^(1 / 0.725)
}

grid <- expand.grid(
  weight = seq(40, 140, length.out = 400),
  height = seq(140, 200, length.out = 400)
)
grid$multiplier <- bsa_dubois(grid$height, grid$weight) / 1.73

# Pharmacopoeia Pigments, the site palette. Diverging about 1.00, which is the
# point of no correction: below it indexing overstates clearance, above it
# understates it.
ink <- "#282828"
low <- "#4d7fa8"
high <- "#bf6050"

breaks <- c(0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5)

# Label every contour. Those that cross the top edge get labelled there; the low
# ones exit through the left edge instead, so label them at a fixed weight.
top <- data.frame(multiplier = breaks)
top$height <- 193
top$weight <- weight_at(top$multiplier, top$height)
top <- top[top$weight >= 44 & top$weight <= 137, ]

side <- data.frame(multiplier = setdiff(breaks, top$multiplier))
side$weight <- 42
side$height <- height_at(side$multiplier, side$weight)
side <- side[side$height >= 143 & side$height <= 197, ]

labels <- rbind(top, side)
labels$text <- sprintf("%.1f×", labels$multiplier)

# WHO normal BMI, as a band in this space: weight = BMI * (height/100)^2
bmi_band <- do.call(rbind, lapply(c(18.5, 25), function(b) {
  h <- seq(140, 200, length.out = 200)
  data.frame(bmi = b, height = h, weight = b * (h / 100)^2)
}))

anchor <- data.frame(weight = weight_at(1, 170), height = 170)

extremes <- data.frame(
  weight = c(45, 120),
  height = c(150, 190),
  label  = c("150 cm, 45 kg: 0.79×\n90 mL/min/1.73 m² → 71 mL/min",
             "190 cm, 120 kg: 1.43×\n90 mL/min/1.73 m² → 128 mL/min"),
  # offset the box in data units rather than with hjust/vjust: out-of-range
  # justification also staggers the individual text lines inside the box
  dx     = c(16, -16.5),
  dy     = c(-5.2, -4)
)

p <- ggplot(grid, aes(weight, height)) +
  geom_raster(aes(fill = multiplier), interpolate = TRUE) +
  geom_contour(aes(z = multiplier), breaks = breaks,
               colour = ink, linewidth = 0.25, alpha = 0.45) +
  geom_contour(aes(z = multiplier), breaks = 1.0,
               colour = ink, linewidth = 0.9) +
  geom_path(data = bmi_band, aes(weight, height, group = bmi),
            linetype = "22", colour = ink, linewidth = 0.5, alpha = 0.65) +
  geom_label(data = labels, aes(label = text), size = 2.9, colour = ink,
             linewidth = 0, fill = "white", alpha = 0.88,
             label.padding = unit(0.09, "lines")) +
  geom_point(data = anchor, size = 2.4, colour = ink) +
  geom_label(data = anchor, aes(label = "1.73 m² reference\n170 cm, 63 kg"),
             nudge_x = 10, nudge_y = 4.2,
             size = 3.0, colour = ink, lineheight = 1.15,
             linewidth = 0, fill = "white", alpha = 0.82,
             label.padding = unit(0.3, "lines")) +
  geom_point(data = extremes, size = 2.1, colour = ink, shape = 21,
             fill = "white", stroke = 0.8) +
  geom_label(data = extremes, aes(label = label),
             position = position_nudge(x = extremes$dx, y = extremes$dy),
             size = 2.95, colour = ink, lineheight = 1.15,
             linewidth = 0, fill = "white", alpha = 0.82,
             label.padding = unit(0.3, "lines")) +
  scale_fill_gradient2(
    low = low, mid = "#f7f5f0", high = high, midpoint = 1,
    limits = c(0.7, 1.5), oob = scales::squish, breaks = c(0.8, 1.0, 1.2, 1.4),
    labels = c("0.8×", "1.0×", "1.2×", "1.4×"),
    name = NULL, guide = guide_colourbar(barheight = unit(3.2, "cm"), barwidth = unit(0.32, "cm"))
  ) +
  scale_x_continuous(breaks = seq(40, 140, 20), labels = function(x) paste0(x, " kg"),
                     expand = expansion(0)) +
  scale_y_continuous(breaks = seq(140, 200, 10), labels = function(y) paste0(y, " cm"),
                     expand = expansion(0)) +
  labs(
    x = "Weight", y = "Height",
    title = "One eGFR, many clearances",
    subtitle = paste("Multiply an indexed eGFR (mL/min/1.73 m²) by this factor to get absolute GFR (mL/min).",
                     "Contours are BSA/1.73 by Du Bois; the dashed pair bounds normal BMI, 18.5 to 25.",
                     sep = "\n")
  ) +
  coord_cartesian(xlim = c(40, 140), ylim = c(140, 200)) +
  theme_minimal(base_size = 11) +
  theme(
    plot.title = element_text(face = "bold", colour = ink, size = 13),
    plot.subtitle = element_text(colour = ink, size = 9.2, lineheight = 1.25,
                                 margin = margin(t = 3, b = 10)),
    axis.title = element_text(colour = ink, size = 10),
    axis.text = element_text(colour = ink, size = 9),
    panel.grid = element_blank(),
    legend.text = element_text(colour = ink, size = 8.5),
    plot.background = element_rect(fill = "white", colour = NA),
    plot.margin = margin(12, 12, 10, 12)
  )

out <- file.path("docs", "concepts", "images", "gfr-indexing.png")
ggsave(out, p, width = 8, height = 5.4, dpi = 150, bg = "white")
cat("wrote", out, "\n")

# sanity values quoted on the page and in the annotations
for (b in list(c(150, 45), c(170, 63), c(170, 70), c(190, 120))) {
  m <- bsa_dubois(b[1], b[2]) / 1.73
  cat(sprintf("  %3d cm %3d kg  BSA %.2f  multiplier %.2f  eGFR 90 -> %.0f mL/min\n",
              b[1], b[2], bsa_dubois(b[1], b[2]), m, 90 * m))
}
