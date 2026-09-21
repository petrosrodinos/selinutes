import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsBoolean, IsUUID } from 'class-validator'
import { CreateProductDto } from './create-product.dto'

const toArray = ({ value }: { value: unknown }): unknown[] => {
    if (value === undefined || value === null || value === '') return []

    return Array.isArray(value) ? value : [value]
}

const toBoolean = ({ value }: { value: unknown }): unknown => (value === 'true' ? true : value === 'false' ? false : value)

export class UpdateProductDto extends CreateProductDto {
    @ApiPropertyOptional({ type: [String], description: 'UUIDs of existing product files to remove' })
    @Transform(toArray)
    @IsArray()
    @IsUUID('all', { each: true })
    remove_file_uuids: string[] = []

    @ApiPropertyOptional({ type: [String], description: 'UUIDs of existing gallery images to remove' })
    @Transform(toArray)
    @IsArray()
    @IsUUID('all', { each: true })
    remove_gallery_uuids: string[] = []

    @ApiPropertyOptional({ description: 'Remove the current cover image (ignored when a new image is uploaded)' })
    @Transform(toBoolean)
    @IsBoolean()
    remove_image: boolean = false
}
