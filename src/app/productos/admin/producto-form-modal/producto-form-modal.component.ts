import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductosService } from 'src/app/core/services/productos.service';
import swall from 'sweetalert2';

@Component({
  selector: 'app-producto-form-modal',
  templateUrl: './producto-form-modal.component.html',
  styleUrls: ['./producto-form-modal.component.css']
})
export class ProductoFormModalComponent implements OnInit, OnChanges {
  @Input() productoId: number | null = null;
  @Output() productoCreado = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  productoForm!: FormGroup;
  marcas: any[] = [];
  tiposPintura: any[] = [];
  imgError = false;
  imgLoading = false;
  imgPreviewUrl: string | null = null;

  constructor(private fb: FormBuilder, private productosService: ProductosService) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarMarcas();
    this.cargarTiposPintura();
    if (this.productoId) {
      this.cargarProductoPorId(this.productoId);
    }
    // Escuchar cambios en el campo foto para validación en tiempo real
    this.productoForm.get('foto')?.valueChanges.subscribe(url => {
      this.validarImagenUrl(url);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productoId'] && this.productoId) {
      this.cargarProductoPorId(this.productoId);
    } else if (changes['productoId'] && !this.productoId && this.productoForm) {
      this.productoForm.reset({
        nombre: '',
        marca: null,
        tipoPintura: null,
        color: '',
        precioVentaGalon: null,
        stockTotal: null,
        estaActivo: true
      });
    }
  }

  cargarMarcas() {
    this.productosService.getMarcas().subscribe(res => this.marcas = res);
  }

  cargarTiposPintura() {
    this.productosService.getTiposPintura().subscribe(res => this.tiposPintura = res);
  }

  cargarProductoPorId(id: number) {
    this.productosService.getProductoById(id).subscribe(producto => {
      // Buscar la instancia correcta de marca y tipoPintura en los arrays
      const marca = this.marcas.find(m => m.id === producto.marca?.id) || null;
      const tipoPintura = this.tiposPintura.find(t => t.id === producto.tipoPintura?.id) || null;
      this.productoForm.patchValue({
        ...producto,
        marca,
        tipoPintura
      });
    });
  }

  initForm() {
    this.productoForm = this.fb.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      marca: [null, Validators.required],
      tipoPintura: [null, Validators.required],
      color: ['', [Validators.required]],
      descripcion: [''],
      foto: ['',[Validators.required]],
      precioCompra: [null, [Validators.required,Validators.min(0)]],
      precioVentaGalon: [null, [Validators.required, Validators.min(0)]],
      permiteGranel: [false],
      precioMedioGalon: [0, [Validators.min(0)]],
      precioCuartoGalon: [0, [Validators.min(0)]],
      precioOctavoGalon: [0, [Validators.min(0)]],
      precioDieciseisavoGalon: [0, [Validators.min(0)]],
      precioTreintaidosavoGalon: [0, [Validators.min(0)]],
      stockTotal: [null, [Validators.required, Validators.min(0)]],
      stockMinimo: [20, [Validators.min(0)]],
      cantidadCerrados: [0, [Validators.min(0)]],
      cantidadAbiertos: [0, [Validators.min(0)]],
      estante: [''],
      fila: [''],
      area: [''],
      estaActivo: [true]
    }, { validators: [this.stockValidator, this.duplicateValidator] });
  }

  // Validador personalizado para comparar stock total y mínimo
  stockValidator(group: FormGroup) {
    const stockTotal = group.get('stockTotal')?.value;
    const stockMinimo = group.get('stockMinimo')?.value;

    if (stockTotal !== null && stockMinimo !== null && stockTotal < stockMinimo) {
      return { stockInvalido: true };
    }
    return null;
  }

  // Método para obtener el mensaje de error del stock
  getStockErrorMessage(): string {
    const stockTotal = this.productoForm.get('stockTotal')?.value;
    const stockMinimo = this.productoForm.get('stockMinimo')?.value;

    if (stockTotal !== null && stockMinimo !== null && stockTotal < stockMinimo) {
      return `El stock total (${stockTotal}) no puede ser menor que el stock mínimo (${stockMinimo})`;
    }
    return '';
  }

  // Validador para duplicados
  duplicateValidator = (group: FormGroup) => {
    const nombre = group.get('nombre')?.value;
    const color = group.get('color')?.value;
    const marca = group.get('marca')?.value;
    const tipoPintura = group.get('tipoPintura')?.value;
    const id = group.get('id')?.value;

    if (nombre && color && marca && tipoPintura) {
      this.productosService.verificarProductoDuplicado(
        nombre,
        color,
        marca.id,
        tipoPintura.id,
        id
      ).subscribe({
        next: (existe) => {
          if (existe) {
            group.setErrors({ productoDuplicado: true });
          }
        }
      });
    }
    return null;
  }

  // Método para obtener el mensaje de error de duplicado
  getDuplicateErrorMessage(): string {
    const nombre = this.productoForm.get('nombre')?.value;
    const color = this.productoForm.get('color')?.value;
    const marca = this.productoForm.get('marca')?.value;
    const tipoPintura = this.productoForm.get('tipoPintura')?.value;

    if (this.productoForm.errors?.['productoDuplicado']) {
      return `Ya existe un producto con el nombre "${nombre}", color "${color}", marca "${marca?.nombre}" y tipo "${tipoPintura?.nombre}"`;
    }
    return '';
  }

  cerrarModal() {
    this.cerrar.emit();
  }

  onSubmitProducto() {
    if (this.productoForm.valid) {
      const productoData = this.productoForm.value;
      this.productosService.crearOActualizarProducto(productoData).subscribe({
        next: () => {
          this.productoForm.reset();
          swall.fire({
            icon: 'success',
            title: this.productoId ? '¡Producto actualizado!' : '¡Producto creado!',
            text: this.productoId ? 'El producto fue actualizado correctamente.' : 'El producto fue registrado correctamente.',
            confirmButtonColor: '#1976d2'
          }).then(() => {
            this.productoCreado.emit();
            this.cerrar.emit();
          });
        },
        error: (err) => {
          swall.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo guardar el producto. Intenta nuevamente.',
            confirmButtonColor: '#d33'
          });
        }
      });
    } else {
      this.productoForm.markAllAsTouched();
    }
  }

  validarImagenUrl(url: string) {
    if (!url) {
      this.imgError = false;
      this.imgPreviewUrl = null;
      return;
    }

    // Validar que sea una URL válida
    try {
      new URL(url);
    } catch {
      this.imgError = true;
      this.imgPreviewUrl = null;
      this.productoForm.get('foto')?.setErrors({ invalidUrl: true });
      return;
    }

    this.imgLoading = true;
    this.imgError = false;

    // Crear una imagen temporal para validar SOLO si se puede cargar
    const img = new Image();
    img.onload = () => {
      this.imgLoading = false;
      this.imgError = false;
      this.imgPreviewUrl = url;
      this.productoForm.get('foto')?.setErrors(null);
    };
    img.onerror = () => {
      this.imgLoading = false;
      this.imgError = true;
      this.imgPreviewUrl = null;
      this.productoForm.get('foto')?.setErrors({ imageNotFound: true });
    };
    img.src = url;
  }

  getImageErrorMessage(): string {
    const fotoControl = this.productoForm.get('foto');
    if (fotoControl?.errors?.['required']) {
      return 'La imagen es obligatoria.';
    }
    if (fotoControl?.errors?.['invalidUrl']) {
      return 'La URL no es válida.';
    }
    if (fotoControl?.errors?.['imageNotFound']) {
      return 'No se pudo cargar la imagen. Verifica la URL.';
    }
    return '';
  }
}
