import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  // Pricing State
  pricingPeriod: 'monthly' | 'yearly' = 'monthly';

  // Calculator State
  calculator = {
    age: 30,
    coverage: 500000,
    cityTier: 1,
    isFamily: false
  };

  faqOpen: number | null = null;

  toggleFaq(index: number) {
    this.faqOpen = this.faqOpen === index ? null : index;
  }

  get calculatedPremium(): number {
    let base = 500;

    // Age factor
    if (this.calculator.age > 30) base += (this.calculator.age - 30) * 20;

    // Coverage factor
    base += (this.calculator.coverage / 100000) * 100;

    // City Tier
    if (this.calculator.cityTier === 1) base *= 1.2;

    // Family
    if (this.calculator.isFamily) base *= 1.5;

    return Math.round(base);
  }

  // Parallax Logic
  mouseX = 0;
  mouseY = 0;

  onMouseMove(event: MouseEvent) {
    this.mouseX = (event.clientX / window.innerWidth - 0.5) * 20; // range -10 to 10
    this.mouseY = (event.clientY / window.innerHeight - 0.5) * 20;
  }
}
